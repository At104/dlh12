import CameraFeed from "./components/CameraFeed";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Hospital Triage System</h1>
        <p className={styles.subtitle}>Patient Video Analysis</p>
      </header>
      <main className={styles.main}>
        <CameraFeed />
      </main>
    </div>
  );
}
