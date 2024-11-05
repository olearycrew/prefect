import { createFileRoute } from '@tanstack/react-router'

import { components } from '@/api/prefect' // Typescript types generated from the Prefect API
import { QueryService } from '@/api/service' // Service object that makes requests to the Prefect API

import WorkPoolsTable from '@/components/work-pools/data-table'

import { useSuspenseQuery } from '@tanstack/react-query'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { z } from 'zod'

// Route for /flows/

// This file should only contain the route definition and loader function for the /flows/ route.

// 1. searchParams defined as a zod schema, so that the search query can be validated and typechecked.
// 2. flowsQueryParams function that takes a search object and returns the queryKey and queryFn for the loader.
// 3. Route definition that uses the createFileRoute function to define the route.
//    - It passes down the result of the loader function to the FlowsTable component.

const searchParams = z.object({
  name: z.string().optional(),
}).default({})

const workPoolsQueryParams = (search: z.infer<typeof searchParams>) => ({
  queryKey: ['work-pools', JSON.stringify(search)],
  queryFn: async () =>
    await QueryService.POST('/work_pools/filter', {
      body: {
        offset: 0,
        limit: 100, 
        work_pools: {
          operator: 'and_',
          ...search.name && {name: { any_: [search.name] }},
        },
      },
    }),
  staleTime: 1000, // Data will be considered stale after 1 second.
})

const WorkPoolsRoute = () => {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(workPoolsQueryParams(search))
  return (
    <WorkPoolsTable workPools={data.data as components["schemas"]["WorkPool"][]} />
  )
}

export const Route = createFileRoute('/work-pools/')({
  validateSearch: zodSearchValidator(searchParams),
  component: WorkPoolsRoute,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: search, context }) =>
    await context.queryClient.ensureQueryData(workPoolsQueryParams(search)),
  wrapInSuspense: true,
})
