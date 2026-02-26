import inquirer from "inquirer";
import prettyBytes from "pretty-bytes";
import Table from "cli-table3";
import { FileInfo, FtpServiceClient } from "./types";
import { listFiles, downloadFile } from "./file-service";

export async function runCli(
  client: FtpServiceClient,
  serverAddr: string,
  downloadDir: string,
  chunkSizeKb: number
): Promise<void> {
  console.log("=== gRPC FTP Client ===");
  console.log(`Server: ${serverAddr}`);
  console.log(`Download dir: ${downloadDir}\n`);

  let running: boolean = true;
  while (running) {
    console.log("Fetching file list...\n");
    let files: FileInfo[];
    try {
      files = await listFiles(client);
    } catch (err) {
      console.error("Connection error:", (err as Error).message);
      break;
    }

    if (files.length === 0) {
      console.log("No files on server.");
      break;
    }

    const table = new Table({
      head: ["#", "Name", "Size", "Modified"],
      colWidths: [5, 34, 12, 27],
    });

    files.forEach((f: FileInfo, i: number) => {
      table.push([
        i + 1,
        f.name.length > 30 ? f.name.substring(0, 27) + "..." : f.name,
        prettyBytes(Number(f.size_bytes)),
        new Date(f.modified_at).toLocaleString(),
      ]);
    });

    console.log(table.toString());
    console.log("");

    let choice: string;
    try {
      const answer = await inquirer.prompt<{ choice: string }>([
        {
          type: "list",
          name: "choice",
          message: "Select a file to download:",
          choices: [
            ...files.map((f: FileInfo, i: number) => ({
              name: `${f.name} (${prettyBytes(Number(f.size_bytes))})`,
              value: String(i),
            })),
            new inquirer.Separator(),
            { name: "Quit", value: "q" },
          ],
        },
      ]);
      choice = answer.choice;
    } catch {
      break;
    }

    if (!choice || choice === "q") {
      running = false;
      continue;
    }

    const idx: number = parseInt(choice, 10);
    try {
      await downloadFile(client, files[idx].name, downloadDir, chunkSizeKb);
    } catch (err) {
      console.error("Download error:", (err as Error).message);
    }
    console.log("");
  }

  client.close();
  console.log("Goodbye!");
  process.exit(0);
}
