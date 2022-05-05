import { RouteObject } from 'react-router-dom'
import { Layout } from '~/components'
import App from './index'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: 'Home',
      },
      {
        path: '/hub',
        element: 'hub/Hub',
        children: [
          {
            index: true,
            element: 'hub/Index',
          },
          {
            path: '/hub/:id',
            element: 'hub/Package',
          },
        ],
      },
      {
        path: '/packages',
        element: 'packages/Packages',
        children: [
          {
            index: true,
            element: 'packages/view/Grid',
          },
          {
            path: '/packages/list',
            element: 'packages/view/List',
          },
          {
            path: '/packages/:id',
            element: 'packages/Package',
          },
        ],
      },
    ],
  },
]

export default routes
