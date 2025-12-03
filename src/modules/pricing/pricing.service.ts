import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingPlan } from './entities/pricing-plan.entity';
import { PricingFeature } from './entities/pricing-feature.entity';
import { ComparisonTable } from './entities/comparison-table.entity';
import { ComparisonRow } from './entities/comparison-row.entity';
import { UpdatePricingDataDto } from './dto/pricing.dto';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    @InjectRepository(PricingPlan)
    private readonly planRepo: Repository<PricingPlan>,
    @InjectRepository(PricingFeature)
    private readonly featureRepo: Repository<PricingFeature>,
    @InjectRepository(ComparisonTable)
    private readonly tableRepo: Repository<ComparisonTable>,
    @InjectRepository(ComparisonRow)
    private readonly rowRepo: Repository<ComparisonRow>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  // ✅ GET ALL PRICING DATA (Page + Plans + Comparison Tables)
  async getPricingData() {
    try {
      console.log('🔍 Getting complete pricing data...');

      // 1. Get pricing page data
      const pageData = await this.getPricingPage();
      
      // 2. Get pricing plans with features
      const plans = await this.planRepo.find({
        where: { is_active: true },
        relations: ['features'],
        order: { ordering: 'ASC' },
      });

      // 3. Get comparison tables with rows
      const comparisonTables = await this.tableRepo.find({
        where: { is_active: true },
        relations: ['rows'],
        order: { ordering: 'ASC' },
      });

      // Transform the data
      const transformedPlans = plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        slug: plan.slug,
        description: plan.description,
        is_popular: plan.is_popular,
        trial_days: plan.trial_days,
        button_text: plan.button_text,
        button_link: plan.button_link,
        monthly_price: parseFloat(plan.monthly_price.toString()),
        yearly_price: plan.yearly_price ? parseFloat(plan.yearly_price.toString()) : null,
        discount_percentage: plan.discount_percentage,
        currency: plan.currency,
        features: plan.features
          .filter((f) => f.is_active)
          .sort((a, b) => a.ordering - b.ordering)
          .map((feature) => ({
            id: feature.id,
            title: feature.title,
            description: feature.description,
          })),
      }));

      const transformedComparisonTables = comparisonTables.map((table) => ({
        id: table.id,
        section_title: table.section_title,
        rows: table.rows
          .filter((r) => r.is_active)
          .sort((a, b) => a.ordering - b.ordering)
          .map((row) => ({
            label: row.label,
            free_value: this.parseValue(row.free_value),
            pro_value: this.parseValue(row.pro_value),
            advanced_value: this.parseValue(row.advanced_value),
          })),
      }));

      return {
        success: true,
        data: {
          page: pageData.page,
          plans: transformedPlans,
          comparison_tables: transformedComparisonTables,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching pricing data:', error);
      throw error;
    }
  }

  // ✅ GET PRICING PAGE DATA ONLY
  async getPricingPage() {
    try {
      console.log('🔍 Getting pricing page...');

      // Find existing pricing page with multiple fallbacks
      let page = await this.pageRepo.findOne({
        where: { 
          url: '/pricing', 
          isActive: true 
        },
      });

      // If not found by URL, try by slug
      if (!page) {
        page = await this.pageRepo.findOne({
          where: { 
            slug: 'pricing', 
            isActive: true 
          },
        });
      }

      // If no page exists, use virtual page
      if (!page) {
        console.log('ℹ️ No pricing page found, using virtual page');

        const virtualPage = {
          id: 0,
          name: 'Pricing',
          title: 'Pricing - Optionia',
          description: 'Choose the perfect plan for your needs',
          slug: 'pricing',
          url: '/pricing',
          subtitle: 'Simple, transparent pricing',
          navbarShow: true,
          order: 0,
          isActive: true,
          type: 'pricing',
          content: null,
          metaTitle: 'Pricing - Optionia',
          metaDescription: 'Choose the perfect plan for your needs with our simple, transparent pricing',
          metaKeywords: ['pricing', 'plans', 'subscription', 'features'],
          canonicalUrl: '/pricing',
          metaImage: null,
          backgroundImage: null,
          backgroundColor: null,
          textColor: null,
          metaData: {
            metaTitle: 'Pricing - Optionia',
            metaDescription: 'Choose the perfect plan for your needs with our simple, transparent pricing',
            keywords: ['pricing', 'plans', 'subscription', 'features'],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          page: virtualPage,
        };
      }

      // Page exists, use it
      console.log('✅ Using existing pricing page:', page.id);

      return {
        page: { ...page },
      };
    } catch (error) {
      console.error('❌ Error in getPricingPage:', error);

      const fallbackPage = {
        id: 0,
        name: 'Pricing',
        title: 'Pricing - Optionia',
        description: 'Choose the perfect plan for your needs',
        slug: 'pricing',
        url: '/pricing',
        subtitle: 'Simple, transparent pricing',
        navbarShow: true,
        order: 0,
        isActive: true,
        type: 'pricing',
        content: null,
        metaTitle: 'Pricing - Optionia',
        metaDescription: 'Choose the perfect plan for your needs with our simple, transparent pricing',
        metaKeywords: ['pricing', 'plans', 'subscription', 'features'],
        canonicalUrl: '/pricing',
        metaImage: null,
        backgroundImage: null,
        backgroundColor: null,
        textColor: null,
        metaData: {
          metaTitle: 'Pricing - Optionia',
          metaDescription: 'Choose the perfect plan for your needs with our simple, transparent pricing',
          keywords: ['pricing', 'plans', 'subscription', 'features'],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        page: fallbackPage,
      };
    }
  }

  // ✅ UPDATE PRICING DATA (FIXED VERSION)
  async updatePricingData(dto: UpdatePricingDataDto) {
    const queryRunner = this.planRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Starting pricing update transaction');

      // 1. CHECK IF THERE ARE EXISTING RECORDS BEFORE UPDATING
      const existingPlans = await this.planRepo.find({ select: ['id'] });
      const existingFeatures = await this.featureRepo.find({ select: ['id'] });
      const existingTables = await this.tableRepo.find({ select: ['id'] });
      const existingRows = await this.rowRepo.find({ select: ['id'] });

      // FIXED: Only update if there are existing records, with proper WHERE criteria
      if (existingPlans.length > 0) {
        await queryRunner.manager.update(
          PricingPlan,
          { is_active: true }, // Only deactivate currently active plans
          { is_active: false },
        );
      }

      if (existingFeatures.length > 0) {
        await queryRunner.manager.update(
          PricingFeature,
          { is_active: true }, // Only deactivate currently active features
          { is_active: false },
        );
      }

      if (existingTables.length > 0) {
        await queryRunner.manager.update(
          ComparisonTable,
          { is_active: true }, // Only deactivate currently active tables
          { is_active: false },
        );
      }

      if (existingRows.length > 0) {
        await queryRunner.manager.update(
          ComparisonRow,
          { is_active: true }, // Only deactivate currently active rows
          { is_active: false },
        );
      }

      // 2. PROCESS PLANS
      for (let i = 0; i < dto.plans.length; i++) {
        const planData = dto.plans[i];

        // Find existing plan by slug or id
        const existingPlan = await queryRunner.manager.findOne(PricingPlan, {
          where: [{ slug: planData.slug }, { id: planData.id }].filter((condition) => condition.slug || condition.id),
        });

        const planToSave = {
          id: existingPlan?.id,
          title: planData.title,
          slug: planData.slug,
          description: planData.description,
          is_popular: planData.is_popular || false,
          trial_days: planData.trial_days,
          button_text: planData.button_text,
          button_link: planData.button_link,
          monthly_price: planData.monthly_price,
          yearly_price: planData.yearly_price,
          discount_percentage: planData.discount_percentage,
          currency: planData.currency || 'USD',
          ordering: i + 1,
          is_active: true,
        };

        const savedPlan = await queryRunner.manager.save(PricingPlan, planToSave);

        // Process features for this plan
        if (planData.features && planData.features.length > 0) {
          // Deactivate existing features for this plan
          if (existingPlan) {
            await queryRunner.manager.update(
              PricingFeature,
              { plan_id: existingPlan.id, is_active: true },
              { is_active: false },
            );
          }

          for (let j = 0; j < planData.features.length; j++) {
            const featureData = planData.features[j];

            const existingFeature = await queryRunner.manager.findOne(PricingFeature, {
              where: [{ id: featureData.id }, { title: featureData.title, plan_id: savedPlan.id }].filter(
                (condition) => condition.id || condition.title,
              ),
            });

            const featureToSave = {
              id: existingFeature?.id,
              plan_id: savedPlan.id,
              title: featureData.title,
              description: featureData.description,
              ordering: j + 1,
              is_active: true,
            };

            await queryRunner.manager.save(PricingFeature, featureToSave);
          }
        }
      }

      // 3. PROCESS COMPARISON TABLES
      for (let i = 0; i < dto.comparison_tables.length; i++) {
        const tableData = dto.comparison_tables[i];

        const existingTable = await queryRunner.manager.findOne(ComparisonTable, {
          where: [{ id: tableData.id }, { section_title: tableData.section_title }].filter(
            (condition) => condition.id || condition.section_title,
          ),
        });

        const tableToSave = {
          id: existingTable?.id,
          section_title: tableData.section_title,
          ordering: i + 1,
          is_active: true,
        };

        const savedTable = await queryRunner.manager.save(ComparisonTable, tableToSave);

        // Process rows for this table
        if (tableData.rows && tableData.rows.length > 0) {
          // Deactivate existing rows for this table
          if (existingTable) {
            await queryRunner.manager.update(
              ComparisonRow,
              { table_id: existingTable.id, is_active: true },
              { is_active: false },
            );
          }

          for (let j = 0; j < tableData.rows.length; j++) {
            const rowData = tableData.rows[j];

            const existingRow = await queryRunner.manager.findOne(ComparisonRow, {
              where: [{ id: rowData.id }, { label: rowData.label, table_id: savedTable.id }].filter(
                (condition) => condition.id || condition.label,
              ),
            });

            const rowToSave = {
              id: existingRow?.id,
              table_id: savedTable.id,
              label: rowData.label,
              free_value: typeof rowData.free_value === 'string' ? rowData.free_value : String(rowData.free_value),
              pro_value: typeof rowData.pro_value === 'string' ? rowData.pro_value : String(rowData.pro_value),
              advanced_value:
                typeof rowData.advanced_value === 'string' ? rowData.advanced_value : String(rowData.advanced_value),
              ordering: j + 1,
              is_active: true,
            };

            await queryRunner.manager.save(ComparisonRow, rowToSave);
          }
        }
      }

      // 4. CLEANUP OLD INACTIVE RECORDS
      await this.cleanupOldInactiveRecords(queryRunner);

      await queryRunner.commitTransaction();
      this.logger.log('Pricing update completed successfully');

      return this.getPricingData(); // Return complete data after update
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating pricing data:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to cleanup old inactive records
  private async cleanupOldInactiveRecords(queryRunner: any) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete features marked inactive for 30+ days
      await queryRunner.manager.delete(PricingFeature, {
        is_active: false,
        updated_at: thirtyDaysAgo,
      });

      // Delete rows marked inactive for 30+ days
      await queryRunner.manager.delete(ComparisonRow, {
        is_active: false,
        updated_at: thirtyDaysAgo,
      });

      this.logger.log('Cleanup completed');
    } catch (cleanupError) {
      this.logger.warn('Cleanup failed, continuing:', cleanupError.message);
      // Don't throw - cleanup is non-critical
    }
  }

  // Helper method to parse string values
  private parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }
}