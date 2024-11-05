import { components } from "@/api/prefect";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { WorkPoolActionMenu, WorkPoolName, WorkPoolToggle } from "./cells";

type WorkPool = components["schemas"]["WorkPool"];

export const columns: ColumnDef<WorkPool>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <WorkPoolName row={row} />,
	},
	{
		accessorKey: "type",
		header: "Type",
	},
	{
		accessorKey: "concurrency_limit",
		header: "Concurrency Limit",
	},
	{
		id: "toggle",
		cell: ({ row }) => <WorkPoolToggle row={row} />,
	},
	{
		id: "actions",
		cell: ({ row }) => <WorkPoolActionMenu row={row} />,
	},
];
