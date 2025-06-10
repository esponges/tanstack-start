import { Await, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense, useEffect, useState } from 'react'

const personServerFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(({ data: name }) => {
    return { name, randomNumber: Math.floor(Math.random() * 100), resolveAt: Date.now() }
  })

const slowServerFn = createServerFn({ method: 'GET' })
  .validator((d: string) => d)
  .handler(async ({ data: name }) => {
    await new Promise((r) => setTimeout(r, 1000))
    return { name, randomNumber: Math.floor(Math.random() * 100), resolveAt: Date.now() }
  })

export const Route = createFileRoute('/deferred')({
  loader: async () => {
    return {
      deferredStuff: new Promise<string>((resolve) =>
        // will be rendered after 2 seconds - wont be rendered immediately
        setTimeout(() => resolve('Hello deferred!'), 2000),
      ),
      // pass the promise abstraction - will be rendered after 1 second - won't be rendered immediately
      deferredPerson: slowServerFn({ data: 'Tanner Linsley' }),
      // route will be rendered once this promise resolves
      person: await personServerFn({ data: 'John Doe' }),
    }
  },
  component: Deferred,
})

function Deferred() {
  const [count, setCount] = useState(0)
  const { deferredStuff, deferredPerson, person } = Route.useLoaderData()
  const renderedAt = Date.now();

  useEffect(() => {
    console.log('Deferred component rendered at:', new Date(renderedAt).toISOString());
  }, [renderedAt]);

  return (
    <div className="p-2">
      <h2>Deferred Route</h2>
      {/* <div>Rendered at: {new Date(renderedAt).toISOString()}</div> */}
      {/* <div>Person loaded at: {new Date(person.resolveAt).toISOString()}</div> */}
      <div data-testid="regular-person">
        {person.name} - {new Date(person.resolveAt).toISOString()}
      </div>
      <Suspense fallback={<div>Loading person...</div>}>
        <Await
          promise={deferredPerson}
          children={(data) => (
            <div data-testid="deferred-person">
              {data.name} - {new Date(data.resolveAt).toISOString()} - {data.randomNumber}
            </div>
          )}
        />
      </Suspense>
      <Suspense fallback={<div>Loading stuff...</div>}>
        <Await
          promise={deferredStuff}
          children={(data) => <h3 data-testid="deferred-stuff">{data}</h3>}
        />
      </Suspense>
      <div>Count: {count}</div>
      <div>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  )
}
