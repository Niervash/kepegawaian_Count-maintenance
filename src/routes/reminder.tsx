import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reminder')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/reminder"!</div>
}
