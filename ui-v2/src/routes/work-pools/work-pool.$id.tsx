import { components } from '@/api/prefect'
import { useSuspenseQueries } from '@tanstack/react-query'
import { QueryService } from "@/api/service";
import { createFileRoute } from '@tanstack/react-router' // Import createFileRoute function from @tanstack/react-router
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { z } from 'zod'

// Route for /flows/flow/$id

// This file contains the route definition and loader function for the /flows/flow/$id route.

// 1. searchParams defined as a zod schema for validating and typechecking the search query.
// 2. filterFlowRunsBySearchParams function that takes a search object and returns a filter for flow runs.
// 3. Route definition using createFileRoute function:
//    - It uses useSuspenseQueries to fetch data for the flow, flow runs, deployments, and related counts.
//    - Passes the fetched data to the FlowDetail component.
//    - Includes a loader function to prefetch data on the server side.
const FlowDetailRoute = () => {
  const { id } = Route.useParams()
  
  return (
    id 
  )
}

export const Route = createFileRoute('/work-pools/work-pool/$id')({
  component: FlowDetailRoute,
  // loader: async ({ params: { id }, context, deps }) => QueryService.POST('/work_pools/filter', {}),
  wrapInSuspense: true,
})
