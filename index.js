import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);

let data = [];

const writeFile = async (data) => {
	try {
		const stringData = JSON.stringify(data);
		await fsp.writeFile(path.join(__dirname, "tasks.json"), stringData);
	} catch (err) {
		console.error(err);
	}
};

const readFile = async () => {
	try {
		if (!fs.existsSync(path.join(__dirname, "tasks.json")))
			await writeFile(data);
		data = JSON.parse(
			await fsp.readFile(path.join(__dirname, "tasks.json"), "utf-8"),
		);
		return data;
	} catch (err) {
		console.error(err);
	}
};

// --- Isolated Functions ---

const handleAdd = async () => {
	const newId = data.length > 0 ? data[data.length - 1].id + 1 : 1;
	const now = new Date().toLocaleString();

	if (args[1]) {
		data.push({
			id: newId,
			description: args[1],
			status: "todo",
			createdAt: now,
			updatedAt: now,
		});
		await writeFile(data);
		console.log(`Task added ${args[1]}`);
	} else {
		console.error("Enter a valid task");
	}
};

const handleUpdate = async () => {
	const taskToUpdate = data.find((task) => task.id === Number(args[1]));

	if (!taskToUpdate) {
		console.error(`Error: Task with ID ${args[1]} not found.`);
	} else if (!args[2]) {
		console.error("Error: Please provide a new description.");
	} else {
		taskToUpdate.description = args[2];
		taskToUpdate.updatedAt = new Date().toLocaleString();
		await writeFile(data);
		console.log(`Task ${args[1]} updated successfully`);
	}
};

const handleList = () => {
	if (!args[1]) {
		for (const task in data) {
			console.log(data[task].description);
		}
	} else {
		const filteredTasks = data.filter((task) => task.status === args[1]);
		if (filteredTasks.length > 0) {
			for (const task of filteredTasks) {
				console.log(`${task.id}: ${task.description}`);
			}
		} else {
			console.error("Operation not defined");
		}
	}
};

const handleMark = async () => {
	const task = data.find((task) => task.id === Number(args[1]));

	if (task) {
		const newStatus = args[0].replace("mark-", "");
		task.status = newStatus;
		task.updatedAt = new Date().toLocaleString();

		await writeFile(data);
		console.log(`Task ${args[1]} marked as ${newStatus}`);
	} else {
		console.error("Task not found");
	}
};

const handleDelete = async () => {
	const idToDelete = Number(args[1]);
	const newData = data.filter((task) => task.id !== idToDelete);

	if (newData.length < data.length) {
		data = newData;
		await writeFile(data);
		console.log(`Task ${idToDelete} deleted successfully.`);
	} else {
		console.error("Task not found");
	}
};

// --- Execution ---

await readFile();

switch (args[0]) {
	case "add":
		await handleAdd();
		break;
	case "update":
		await handleUpdate();
		break;
	case "list":
		handleList();
		break;
	case "delete":
		await handleDelete();
		break;
	default:
		if (args[0]?.startsWith("mark-")) {
			await handleMark();
		} else {
			console.error("Command not found");
		}
		break;
}
