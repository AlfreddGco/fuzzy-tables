import React, { useCallback, useRef, useState } from "react";
import {
	buildTable,
	CreateForm,
	CreateFormRef,
	UpdateForm,
	UpdateFormRef,
} from "fuzzy-tables";
import { SingleSelectExample } from "./SingleSelectExample";

// Define our schema and fields once and reuse for both Table and Forms
const userFields = [
	{
		field: "name",
		header: "Name",
		z: z.string().min(2, "Name must be at least 2 characters"),
	},
	{
		field: "email",
		header: "Email",
		z: z.string().email("Invalid email address"),
	},
	{
		field: "status",
		header: "Status",
		z: z.enum(["active", "inactive"]),
	},
	{
		field: "lastLogin",
		header: "Last Login",
		z: z.date(),
	},
	{
		field: "isVerified",
		header: "Verified",
		z: z.boolean(),
	},
];

// Sample data
const DEMO_DATA = [
	{
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		status: "active",
		tags: ["developer", "frontend"],
		lastLogin: new Date("2024-03-15T10:30:00Z"),
		isVerified: true,
		metadata: { role: "admin", level: 3 },
	},
	{
		id: "2",
		name: "Jane Smith",
		email: "jane@example.com",
		status: "inactive",
		tags: ["designer", "ui/ux"],
		lastLogin: new Date("2024-03-14T15:45:00Z"),
		isVerified: false,
		metadata: { role: "user", level: 2 },
	},
	{
		id: "3",
		name: "Bob Johnson",
		email: "bob@example.com",
		status: "active",
		tags: ["developer", "backend"],
		lastLogin: new Date("2024-03-16T09:15:00Z"),
		isVerified: true,
		metadata: { role: "admin", level: 4 },
	},
];

// Basic Table Example
const BasicTable = buildTable(["name", "email", "status"]);

// Advanced Table with all field types
const AdvancedTable = buildTable(
	["name", "email", "status", "tags", "lastLogin", "isVerified", "metadata"],
	["Edit", "Delete"],
);

import { z } from "zod";
const FromZodObject = buildTable(
	z.object({
		id: z.string(),
		name: z.string(),
		email: z.string().email(),
		status: z.enum(["active", "inactive"]),
		tags: z.array(z.string()),
		lastLogin: z.date(),
		isVerified: z.boolean(),
		metadata: z.object({
			role: z.string(),
			level: z.number(),
		}),
	}),
);

// Basic Table Example
const OnRowClickedTable = buildTable(["name", "email", "status"]);

// Create the table with edit/delete actions
const UserTable = buildTable(
	userFields.map((f) => f.field),
	["edit"],
);

const TableDemo: React.FC = () => {
	const [users, setUsers] = useState(DEMO_DATA);
	const [activeTab, setActiveTab] = useState<"tables" | "singleSelect">("tables");
	const createFormRef = useRef<CreateFormRef>(null);
	const updateFormRef = useRef<UpdateFormRef<(typeof DEMO_DATA)[0]>>(null);

	// Handler for creating new users
	const handleCreate = async (formData: (typeof DEMO_DATA)[0]) => {
		const newUser = {
			...formData,
			id: Math.random().toString(36).substr(2, 9),
		};
		setUsers((prev) => [...prev, newUser]);
	};

	// Handler for updating users
	const handleUpdate = async (id: string, formData: (typeof DEMO_DATA)[0]) => {
		setUsers((prev) =>
			prev.map((user) => (user.id === id ? { ...formData, id } : user)),
		);
	};

	// Register table handlers
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const editUserHandler = useCallback((row: any) => {
		updateFormRef.current?.openEditModal(row);
	}, []);
	UserTable.useHandler("edit", editUserHandler);

	return (
		<div className="flex flex-col p-8 gap-y-8">
			{/* Tab navigation */}
			<div className="flex gap-4 border-b border-gray-200">
				<button
					onClick={() => setActiveTab("tables")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "tables"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 hover:text-gray-800"
					}`}
				>
					Table Examples
				</button>
				<button
					onClick={() => setActiveTab("singleSelect")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "singleSelect"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 hover:text-gray-800"
					}`}
				>
					Single Select Example
				</button>
			</div>

			{activeTab === "tables" ? (
				<>
					<div>
						<h2 className="text-xl font-bold mb-4">Basic Table Example</h2>
						<BasicTable data={DEMO_DATA} />
					</div>

			<div>
				<h2 className="text-xl font-bold mb-4">Advanced Table Example</h2>
				<p className="text-sm text-gray-600 mb-4">
					Demonstrates all supported field types and row handlers
				</p>
				<AdvancedTable data={DEMO_DATA} />
			</div>

			<div>
				<h2 className="text-xl font-bold mb-4">From Zod Object</h2>
				<FromZodObject data={DEMO_DATA} />
			</div>

			<div>
				<h2 className="text-xl font-bold mb-4">With onRowClick</h2>
				<OnRowClickedTable
					data={DEMO_DATA}
					onRowClick={(row) => {
						alert(`Row clicked: ${row.name}`);
					}}
				/>
			</div>

			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">With Forms</h1>
				<button
					onClick={() => createFormRef.current?.open()}
					className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors duration-200"
					type="button"
				>
					Add User
				</button>
			</div>

			<UserTable data={users} />

			<CreateForm
				ref={createFormRef}
				fields={userFields}
				onSubmit={handleCreate}
				title="Add New User"
				description="Create a new user account"
			/>

			<UpdateForm
				ref={updateFormRef}
				fields={userFields}
				onSubmit={handleUpdate}
				title="Edit User"
				description="Update user information"
			/>

					<div className="mt-8 p-4 bg-gray-50 rounded-lg">
						<h2 className="text-lg font-semibold mb-4">Features demonstrated:</h2>
						<ul className="list-disc list-inside space-y-2">
							<li>Row selection (individual and bulk)</li>
							<li>Column sorting</li>
							<li>
								Different field type rendering (string, date, boolean, arrays,
								objects)
							</li>
							<li>Row handlers (edit/delete actions)</li>
							<li>Colored tags with rainbow effect</li>
							<li>Reusable field definitions for both Tables and Forms</li>
							<li>Create new records with validation</li>
							<li>Edit existing records</li>
							<li>Delete records</li>
							<li>Form validation with Zod schemas</li>
							<li>Side panel forms with smooth animations</li>
							<li>All table features (sorting, selection, etc.)</li>
						</ul>
					</div>
				</>
			) : (
				<SingleSelectExample />
			)}
		</div>
	);
};

export default TableDemo;
