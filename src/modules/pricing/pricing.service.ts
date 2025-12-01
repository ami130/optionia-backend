// src/modules/pricing/pricing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { PricingPlan } from './entities/pricing-plan.entity';
import { PricingFeature } from './entities/pricing-feature.entity';
import { ComparisonTable } from './entities/comparison-table.entity';
import { ComparisonRow } from './entities/comparison-row.entity';
import { UpdatePricingDataDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingPlan)
    private readonly planRepo: Repository<PricingPlan>,
    @InjectRepository(PricingFeature)
    private readonly featureRepo: Repository<PricingFeature>,
    @InjectRepository(ComparisonTable)
    private readonly tableRepo: Repository<ComparisonTable>,
    @InjectRepository(ComparisonRow)
    private readonly rowRepo: Repository<ComparisonRow>,
  ) {}

  // ✅ GET ALL PRICING DATA (Public)
  async getPricingData() {
    // Get all active plans with features
    const plans = await this.planRepo.find({
      where: { is_active: true },
      relations: ['features'],
      order: { ordering: 'ASC' },
    });

    // Get all active comparison tables with rows
    const comparisonTables = await this.tableRepo.find({
      where: { is_active: true },
      relations: ['rows'],
      order: { ordering: 'ASC' },
    });

    // Transform response
    return {
      success: true,
      data: {
        plans: plans.map((plan) => ({
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
        })),
        comparison_tables: comparisonTables.map((table) => ({
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
        })),
      },
    };
  }

  // ✅ UPDATE PRICING DATA (Admin)
  // Update the service method to handle ordering properly
  async updatePricingData(dto: UpdatePricingDataDto) {
    const queryRunner = this.planRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get all existing IDs
      const existingPlanIds = (await this.planRepo.find({ select: ['id'] })).map((p) => p.id);
      const existingFeatureIds = (await this.featureRepo.find({ select: ['id'] })).map((f) => f.id);
      const existingTableIds = (await this.tableRepo.find({ select: ['id'] })).map((t) => t.id);
      const existingRowIds = (await this.rowRepo.find({ select: ['id'] })).map((r) => r.id);

      // Process plans
      const newPlanIds: number[] = [];
      for (let i = 0; i < dto.plans.length; i++) {
        const planDto = dto.plans[i];
        let plan: PricingPlan;

        if (planDto.id && existingPlanIds.includes(planDto.id)) {
          // Update existing plan
          plan = await this.planRepo.findOne({ where: { id: planDto.id } });
          Object.assign(plan, {
            ...planDto,
            ordering: i,
            is_active: planDto.is_active !== undefined ? planDto.is_active : true,
          });
        } else {
          // Create new plan
          plan = this.planRepo.create({
            ...planDto,
            ordering: i,
            is_active: planDto.is_active !== undefined ? planDto.is_active : true,
          });
        }

        const savedPlan = await queryRunner.manager.save(PricingPlan, plan);
        newPlanIds.push(savedPlan.id);

        // Process features for this plan
        const newFeatureIds: number[] = [];
        for (let j = 0; j < planDto.features.length; j++) {
          const featureDto = planDto.features[j];
          let feature: PricingFeature;

          if (featureDto.id && existingFeatureIds.includes(featureDto.id)) {
            // Update existing feature
            feature = await this.featureRepo.findOne({ where: { id: featureDto.id } });
            Object.assign(feature, {
              ...featureDto,
              plan_id: savedPlan.id,
              ordering: j,
              is_active: featureDto.is_active !== undefined ? featureDto.is_active : true,
            });
          } else {
            // Create new feature
            feature = this.featureRepo.create({
              ...featureDto,
              plan_id: savedPlan.id,
              ordering: j,
              is_active: featureDto.is_active !== undefined ? featureDto.is_active : true,
            });
          }

          const savedFeature = await queryRunner.manager.save(PricingFeature, feature);
          newFeatureIds.push(savedFeature.id);
        }

        // Delete removed features
        if (newFeatureIds.length > 0) {
          await queryRunner.manager.delete(PricingFeature, {
            plan_id: savedPlan.id,
            id: Not(In(newFeatureIds)),
          });
        } else {
          // If no features, delete all features for this plan
          await queryRunner.manager.delete(PricingFeature, {
            plan_id: savedPlan.id,
          });
        }
      }

      // Delete removed plans
      if (newPlanIds.length > 0) {
        await queryRunner.manager.delete(PricingPlan, {
          id: Not(In(newPlanIds)),
        });
      } else {
        // If no plans, delete all plans
        await this.planRepo.clear();
      }

      // Process comparison tables
      const newTableIds: number[] = [];
      for (let i = 0; i < dto.comparison_tables.length; i++) {
        const tableDto = dto.comparison_tables[i];
        let table: ComparisonTable;

        if (tableDto.id && existingTableIds.includes(tableDto.id)) {
          // Update existing table
          table = await this.tableRepo.findOne({ where: { id: tableDto.id } });
          Object.assign(table, {
            ...tableDto,
            ordering: i,
            is_active: tableDto.is_active !== undefined ? tableDto.is_active : true,
          });
        } else {
          // Create new table
          table = this.tableRepo.create({
            ...tableDto,
            ordering: i,
            is_active: tableDto.is_active !== undefined ? tableDto.is_active : true,
          });
        }

        const savedTable = await queryRunner.manager.save(ComparisonTable, table);
        newTableIds.push(savedTable.id);

        // Process rows for this table
        const newRowIds: number[] = [];
        for (let j = 0; j < tableDto.rows.length; j++) {
          const rowDto = tableDto.rows[j];
          let row: ComparisonRow;

          if (rowDto.id && existingRowIds.includes(rowDto.id)) {
            // Update existing row
            row = await this.rowRepo.findOne({ where: { id: rowDto.id } });
            Object.assign(row, {
              ...rowDto,
              table_id: savedTable.id,
              ordering: j,
              is_active: rowDto.is_active !== undefined ? rowDto.is_active : true,
            });
          } else {
            // Create new row
            row = this.rowRepo.create({
              ...rowDto,
              table_id: savedTable.id,
              ordering: j,
              is_active: rowDto.is_active !== undefined ? rowDto.is_active : true,
            });
          }

          const savedRow = await queryRunner.manager.save(ComparisonRow, row);
          newRowIds.push(savedRow.id);
        }

        // Delete removed rows
        if (newRowIds.length > 0) {
          await queryRunner.manager.delete(ComparisonRow, {
            table_id: savedTable.id,
            id: Not(In(newRowIds)),
          });
        } else {
          // If no rows, delete all rows for this table
          await queryRunner.manager.delete(ComparisonRow, {
            table_id: savedTable.id,
          });
        }
      }

      // Delete removed tables
      if (newTableIds.length > 0) {
        await queryRunner.manager.delete(ComparisonTable, {
          id: Not(In(newTableIds)),
        });
      } else {
        // If no tables, delete all tables
        await this.tableRepo.clear();
      }

      await queryRunner.commitTransaction();

      // Return updated data
      return this.getPricingData();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Helper method to parse string values
  private parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;

    // Try to parse as number
    if (!isNaN(Number(value))) return Number(value);

    // Return as string
    return value;
  }
}
