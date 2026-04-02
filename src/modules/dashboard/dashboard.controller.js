import { recordRepository } from "../financial-record/record.repository.js";
import { success, error } from "../../utils/api-response.js";

export const dashboardController = {
  async getSummary() {
    try {
      const [aggregates, categoryTotals, monthlySummary, weeklySummary, recentTransactions] =
        await Promise.all([
          recordRepository.aggregate(),
          recordRepository.categoryTotals(),
          recordRepository.monthlySummary(),
          recordRepository.weeklySummary(),
          recordRepository.recentTransactions(10),
        ]);

      return success({
        ...aggregates,
        categoryTotals,
        monthlySummary,
        weeklySummary,
        recentTransactions,
      });
    } catch (err) {
      return error(err.message || "Failed to fetch dashboard data");
    }
  },
};
