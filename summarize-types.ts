// Summarize vehicle types from email_results.json

interface EmailResult {
  id: string;
  subject: string;
  to: string[];
  from: string;
  createdAt: string;
  html: string | null;
  text: string | null;
}

async function main() {
  const data: EmailResult[] = await Bun.file("email_results.json").json();
  const typeCounts: Record<string, number> = {};

  for (const email of data) {
    const match = email.html?.match(/<strong>Type:<\/strong>\s*([^<]+)<\/p>/);
    const type = match ? match[1].trim() : "Unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }

  console.log(`\nVehicle Type Summary (Total: ${data.length} emails)\n`);
  console.log("=".repeat(55));

  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  for (const [type, count] of sorted) {
    const percentage = ((count / data.length) * 100).toFixed(1);
    console.log(`${type.padEnd(40)} ${String(count).padStart(5)}  (${percentage}%)`);
  }

  console.log("=".repeat(55));
}

main();
