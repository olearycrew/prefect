import { components } from "@/api/prefect";
import { DataTable } from "@/components/ui/data-table";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { columns } from "./columns";

export default function FlowsTable({
	workPools,
}: {
	workPools: components["schemas"]["WorkPool"][];
}) {
	const table = useReactTable({
		columns: columns,
		data: workPools,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageIndex: 0,
				pageSize: 10,
			},
		},
	});

	return (
		<div className="h-full">
			<DataTable table={table} />
		</div>
	);
}
