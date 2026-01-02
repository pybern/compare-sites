import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Parse command line argument for days (default: 3)
const validDays = [3, 15, 30] as const;
const argDays = parseInt(process.argv[2] || "3", 10);
const days = validDays.includes(argDays as typeof validDays[number]) ? argDays : 3;

if (process.argv[2] && !validDays.includes(argDays as typeof validDays[number])) {
  console.log(`Invalid days option. Valid options: ${validDays.join(", ")}. Using default: 3`);
}

// Date range calculation
const endDate = new Date();
endDate.setHours(23, 59, 59, 999);
const startDate = new Date();
startDate.setDate(startDate.getDate() - days);
startDate.setHours(0, 0, 0, 0);

const SUBJECT_PREFIX = "New Custom Quote Request - CQ";

interface EmailSummary {
  id: string;
  subject: string;
  to: string[];
  from: string;
  createdAt: string;
  html: string | null;
  text: string | null;
}

async function getAllSentEmails() {
  const allEmails: Array<{
    id: string;
    subject: string;
    to: string[];
    from: string;
    created_at: string;
  }> = [];

  let hasMore = true;
  let cursor: string | undefined;

  console.log("Fetching sent emails...");

  while (hasMore) {
    const { data, error } = await resend.emails.list(
      cursor ? { limit: 100, after: cursor } : { limit: 100 }
    );

    if (error) {
      console.error("Error fetching emails:", error);
      throw error;
    }

    if (data?.data) {
      allEmails.push(...data.data);
      hasMore = data.has_more ?? false;

      // Log progress every 100 emails
      console.log(`Retrieved ${allEmails.length} emails so far...`);

      // Check if oldest email in this chunk is before our start date
      if (data.data.length > 0) {
        const oldestInChunk = data.data[data.data.length - 1];
        if (oldestInChunk) {
          const oldestDate = new Date(oldestInChunk.created_at);
          if (oldestDate < startDate) {
            console.log(`Oldest email in chunk (${oldestDate.toISOString()}) is before start date, stopping fetch.`);
            hasMore = false;
          } else if (hasMore) {
            cursor = oldestInChunk.id;
          }
        }
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Total emails fetched: ${allEmails.length}`);
  return allEmails;
}

function filterEmails(
  emails: Array<{
    id: string;
    subject: string;
    to: string[];
    from: string;
    created_at: string;
  }>
) {
  return emails.filter((email) => {
    const emailDate = new Date(email.created_at);

    // Check date range
    const isInDateRange = emailDate >= startDate && emailDate <= endDate;

    // Check subject prefix
    const hasMatchingSubject = email.subject?.startsWith(SUBJECT_PREFIX);

    return isInDateRange && hasMatchingSubject;
  });
}

async function getEmailBody(emailId: string): Promise<EmailSummary | null> {
  const { data, error } = await resend.emails.get(emailId);

  if (error) {
    console.error(`Error fetching email ${emailId}:`, error);
    return null;
  }

  return {
    id: data.id,
    subject: data.subject,
    to: data.to,
    from: data.from,
    createdAt: data.created_at,
    html: data.html,
    text: data.text,
  };
}

// Process emails in batches of 2 per second (rate limit)
async function getEmailBodiesInBatches(
  emails: Array<{ id: string; subject: string }>
): Promise<EmailSummary[]> {
  const results: EmailSummary[] = [];
  const BATCH_SIZE = 2; // 2 requests per second rate limit

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(emails.length / BATCH_SIZE)} (${batch.map(e => e.subject).join(", ")})`);

    const batchResults = await Promise.all(
      batch.map((email) => getEmailBody(email.id))
    );

    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }

    // Wait 1 second before next batch to respect rate limit
    if (i + BATCH_SIZE < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Resend Email Retrieval");
  console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`Subject filter: starts with "${SUBJECT_PREFIX}"`);
  console.log("=".repeat(60));

  try {
    // Step 1: Fetch all sent emails
    const allEmails = await getAllSentEmails();

    // Step 2: Filter by date and subject
    const filteredEmails = filterEmails(allEmails);
    console.log(`\nFiltered emails matching criteria: ${filteredEmails.length}`);

    if (filteredEmails.length === 0) {
      console.log("No emails found matching the criteria.");
      return;
    }

    // Step 3: Retrieve full email body for each filtered email (2 parallel requests per second)
    console.log("\nRetrieving email body content (2 requests/second)...\n");

    const results = await getEmailBodiesInBatches(filteredEmails);

    // Step 4: Save results to file
    const outputFile = "email_results.json";
    await Bun.write(outputFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${outputFile}`);
    console.log(`Total emails with body content: ${results.length}`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();