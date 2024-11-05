import { components } from "@/api/prefect";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
type WorkPool = components["schemas"]["WorkPool"];

export const WorkPoolStatusIndicator = ({ status }: { status: components["schemas"]["WorkPoolStatus"] | null | undefined }) => {
  if (status === "READY") {
    return (
      <div className="flex items-center" title="Ready">
        <div className="h-2 w-2 rounded-full bg-green-500" />
      </div>
    );
  }

  if (status === "PAUSED") {
    return (
      <div className="flex items-center" title="Paused">
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
      </div>
    );
  }

  if (status === "NOT_READY") {
    return (
      <div className="flex items-center" title="Not Ready">
        <div className="h-2 w-2 rounded-full bg-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center" title="Unknown">
      <div className="h-2 w-2 rounded-full bg-transparent border-dashed" />
    </div>
  );
};


export const WorkPoolName= ({ row }: { row: { original: WorkPool } }) => {
	const name = row.original.name;
	const status = row.original.status;
	return (
		<div className="flex items-center gap-2 -ml-4">
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger asChild>
						<div className={`flex items-center gap-2 ${!status ? "invisible" : ""}`}>
							<WorkPoolStatusIndicator status={status} />
						</div>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{status}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<Link to={`/work-pools/${row.original.id}`}>{name}</Link>
		</div>
	);
};


export const WorkPoolToggle = ({ row }: { row: { original: WorkPool } }) => {
	const isPaused = row.original.status === "PAUSED";

	return (
		<Switch
			checked={!isPaused}
			aria-label={`${isPaused ? "Resume" : "Pause"} work pool`}
		/>
	);
};



export const WorkPoolActionMenu = ({ row }: { row: { original: WorkPool } }) => {
	const id = row.original.id;
	if (!id) {
		return null;
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreVerticalIcon className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem
					onClick={() => void navigator.clipboard.writeText(id)}
				>
					Copy ID
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Edit</DropdownMenuItem>
				<DropdownMenuItem>Delete</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Automate</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
