import React, { ReactNode } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import tw from 'twin.macro'
import MetricsIcon from './icons/MetricsIcon'
import ProfilesIcon from './icons/ProfilesIcon'
import SettingsIcon from './icons/SettingsIcon'

interface NavItemProps {
  children: ReactNode
  linkTo: string
}

const NavItem: React.FC<NavItemProps> = ({ linkTo, children }) => {
  const { pathname } = useLocation()
  const isActive = pathname === linkTo

  return (
    <li
      css={[
        tw`flex items-center justify-center w-12 h-12 rounded-full dark:bg-black light:bg-white`,
        isActive
          ? tw`dark:text-lighter-grey light:text-darker-grey`
          : tw`dark:(text-medium-grey opacity-50) light:(text-darker-grey opacity-25)`,
      ]}
    >
      <Link to={linkTo}>{children}</Link>
    </li>
  )
}

const Layout = () => (
  <div tw="h-screen font-lab-grotesque light:(bg-off-white text-darker-grey) dark:(bg-dark-grey text-lighter-grey)">
    <nav tw="w-full fixed bottom-0 light:(bg-off-white bg-opacity-80 backdrop-blur text-darker-grey) dark:(bg-dark-grey bg-opacity-80 backdrop-blur text-lighter-grey)">
      <ul tw="flex flex-row justify-between py-8 px-14">
        <NavItem linkTo="/settings">
          <SettingsIcon />
        </NavItem>
        <NavItem linkTo="/">
          <MetricsIcon />
        </NavItem>
        <NavItem linkTo="/profiles">
          <ProfilesIcon />
        </NavItem>
      </ul>
    </nav>

    <main tw="p-14">
      <Outlet />
    </main>
  </div>
)

export default Layout
