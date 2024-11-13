import { getQueryService } from "@/api/service";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { VariablesPage } from "@/components/variables/page";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import type {
	ColumnFiltersState,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { useCallback, useMemo } from "react";

const searchParams = z.object({
	offset: z.number().int().nonnegative().optional().default(0),
	limit: z.number().int().positive().optional().default(10),
	sort: z
		.enum(["CREATED_DESC", "UPDATED_DESC", "NAME_ASC", "NAME_DESC"])
		.optional()
		.default("CREATED_DESC"),
	name: z.string().optional(),
});

const buildVariablesQuery = (search: z.infer<typeof searchParams>) => ({
	queryKey: ["variables", JSON.stringify(search)],
	queryFn: async () => {
		const { name, ...rest } = search;
		const response = await getQueryService().POST("/variables/filter", {
			body: {
				...rest,
				variables: { operator: "and_", name: { like_: name } },
			},
		});
		return response.data;
	},
	staleTime: 1000,
	placeholderData: keepPreviousData,
});

const buildTotalVariableCountQuery = (
	search?: z.infer<typeof searchParams>,
) => {
	// Construct the query key so that a single request is made for each unique search value
	//  This is useful on initial load to avoid making duplicate calls for total and current count
	const queryKey = ["total-variable-count"];
	if (search?.name) {
		queryKey.push(search.name);
	}
	return {
		queryKey,
		queryFn: async () => {
			if (!search || !search.name) {
				const response = await getQueryService().POST("/variables/count");
				return response.data;
			}
			const { name } = search;
			const response = await getQueryService().POST("/variables/count", {
				body: {
					variables: { operator: "and_", name: { like_: name } },
				},
			});
			return response.data;
		},
	};
};

function VariablesRoute() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const { data: variables } = useSuspenseQuery(buildVariablesQuery(search));
	const { data: currentVariableCount } = useSuspenseQuery(
		buildTotalVariableCountQuery(search),
	);
	const { data: totalVariableCount } = useSuspenseQuery(
		buildTotalVariableCountQuery(),
	);

	const pageIndex = search.offset ? search.offset / search.limit : 0;
	const pageSize = search.limit ?? 10;
	const pagination: PaginationState = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize],
	);
	const columnFilters: ColumnFiltersState = useMemo(
		() => [{ id: "name", value: search.name }],
		[search.name],
	);

	const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			let newPagination = pagination;
			if (typeof updater === "function") {
				newPagination = updater(pagination);
			} else {
				newPagination = updater;
			}
			void navigate({
				to: ".",
				search: (prev) => ({
					...prev,
					offset: newPagination.pageIndex * newPagination.pageSize,
					limit: newPagination.pageSize,
				}),
				replace: true,
			});
		},
		[pagination, navigate],
	);

	const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
		(updater) => {
			let newColumnFilters = columnFilters;
			if (typeof updater === "function") {
				newColumnFilters = updater(columnFilters);
			} else {
				newColumnFilters = updater;
			}
			void navigate({
				to: ".",
				search: (prev) => ({
					...prev,
					offset: 0,
					name: newColumnFilters.find((filter) => filter.id === "name")
						?.value as string,
				}),
				replace: true,
			});
		},
		[columnFilters, navigate],
	);

	return (
		<VariablesPage
			variables={variables ?? []}
			totalVariableCount={totalVariableCount ?? 0}
			currentVariableCount={currentVariableCount ?? 0}
			pagination={pagination}
			onPaginationChange={onPaginationChange}
			columnFilters={columnFilters}
			onColumnFiltersChange={onColumnFiltersChange}
		/>
	);
}

export const Route = createFileRoute("/variables")({
	validateSearch: zodSearchValidator(searchParams),
	component: VariablesRoute,
	loaderDeps: ({ search }) => search,
	loader: ({ deps: search, context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(buildVariablesQuery(search)),
			context.queryClient.ensureQueryData(buildTotalVariableCountQuery(search)),
			context.queryClient.ensureQueryData(buildTotalVariableCountQuery()),
		]),
	wrapInSuspense: true,
});
