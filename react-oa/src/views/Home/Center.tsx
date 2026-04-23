import One from "./com/center-one";
import Two from "./com/center-two";
import styles from "@/assets/styles/home/home.module.scss";
import type { DashboardTrend } from "@/api/dashboard";

interface CenterProps {
  trends: DashboardTrend[];
}

export default function Center({ trends }: CenterProps) {
  return (
    <div className={styles.chartGrid}>
      <div className={styles.chartCard}>
        <One trends={trends} />
      </div>
      <div className={styles.chartCard}>
        <Two trends={trends} />
      </div>
    </div>
  );
}
