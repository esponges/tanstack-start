import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

type DataItem = {
  id: number
  name: string
  status: 'active' | 'inactive'
  createdAt: string
}

const data: DataItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  status: Math.random() > 0.5 ? 'active' : 'inactive',
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
}))

export const Route = createFileRoute('/data-table')({
  validateSearch: z.object({
    sort: z.enum(['asc', 'desc']).default('asc'),
    sortBy: z.enum(['name', 'status', 'createdAt']).default('name'),
    filter: z.string().optional(),
    status: z.enum(['active', 'inactive', 'all']).default('all'),
  }),
  component: DataTable,
})

function DataTable() {
  const { sort, sortBy, filter, status } = Route.useSearch()
  const navigate = useNavigate({ from: '/data-table' })

  const filteredAndSortedData = data
    .filter((item) => {
      if (filter) {
        return item.name.toLowerCase().includes(filter.toLowerCase())
      }
      return true
    })
    .filter((item) => {
      if (status === 'all') return true
      return item.status === status
    })
    .sort((a, b) => {
      const sortMultiplier = sort === 'asc' ? 1 : -1
      if (sortBy === 'name') {
        return sortMultiplier * a.name.localeCompare(b.name)
      }
      if (sortBy === 'status') {
        return sortMultiplier * a.status.localeCompare(b.status)
      }
      if (sortBy === 'createdAt') {
        return sortMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
      return 0
    })

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Table with Search Params</h1>
      
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter ?? ''}
          onChange={(e) => {
            navigate({
              search: (prev) => ({ ...prev, filter: e.target.value || undefined })
            })
          }}
          className="px-3 py-2 border rounded"
        />
        
        <select
          value={status}
          onChange={(e) => {
            navigate({
              search: (prev) => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'all' })
            })
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr>
            <th
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortBy: 'name',
                    sort: prev.sortBy === 'name' && prev.sort === 'asc' ? 'desc' : 'asc'
                  })
                })
              }}
              className="cursor-pointer p-2 border"
            >
              Name {sortBy === 'name' && (sort === 'asc' ? '↑' : '↓')}
            </th>
            <th
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortBy: 'status',
                    sort: prev.sortBy === 'status' && prev.sort === 'asc' ? 'desc' : 'asc'
                  })
                })
              }}
              className="cursor-pointer p-2 border"
            >
              Status {sortBy === 'status' && (sort === 'asc' ? '↑' : '↓')}
            </th>
            <th
              onClick={() => {
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortBy: 'createdAt',
                    sort: prev.sortBy === 'createdAt' && prev.sort === 'asc' ? 'desc' : 'asc'
                  })
                })
              }}
              className="cursor-pointer p-2 border"
            >
              Created At {sortBy === 'createdAt' && (sort === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedData.map((item) => (
            <tr key={item.id}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">
                <span
                  className={`inline-block px-2 py-1 rounded ${
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="p-2 border">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Current Search Params:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ sort, sortBy, filter, status }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
