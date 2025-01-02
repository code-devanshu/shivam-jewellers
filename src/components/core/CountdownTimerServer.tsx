import CountdownTimerClient from "./CountdownTimerClient";

interface CountdownTimerServerProps {
  targetDate: string; // ISO format, e.g., "2024-12-31T23:59:59Z"
}

export default function CountdownTimerServer({
  targetDate,
}: CountdownTimerServerProps) {
  const target = new Date(targetDate);
  const now = new Date();
  const difference = target.getTime() - now.getTime();

  const initialTimeLeft =
    difference > 0
      ? {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <CountdownTimerClient
      initialTimeLeft={initialTimeLeft}
      targetDate={targetDate}
    />
  );
}
