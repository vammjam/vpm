import { RouteObject } from 'react-router-dom'

export default [
  {
    path: '/',
    element: 'Layout',
    children: [
      {
        index: true,
        element: 'Home',
      },
      {
        path: '/hub',
        element: 'Hub',
        children: [
          {
            index: true,
            element: 'Packages/Hub',
          },
          {
            path: '/hub/:id',
            element: 'Packages/Package',
          },
        ],
      },
      {
        path: '/packages',
        element: 'Packages',
        children: [
          {
            index: true,
            element: 'Packages/GridView',
          },
          {
            path: '/packages/list',
            element: 'Packages/ListView',
          },
          {
            path: '/packages/:id',
            element: 'Packages/Package',
          },
        ],
      },
    ],
  },
] as RouteObject[]
