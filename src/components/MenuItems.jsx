import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
        background: "#141414",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/home">
        <NavLink to="/home">Home</NavLink>
      </Menu.Item>
      <Menu.Item key="/findpet">
        <NavLink to="/findpet">Pet Finder</NavLink>
      </Menu.Item>
      <Menu.Item key="/donation">
        <NavLink to="/donation">Donation</NavLink>
      </Menu.Item>
      <Menu.Item key="/statistics">
        <NavLink to="/statistics">Statistics</NavLink>
      </Menu.Item>
      <Menu.Item key="/about">
        <NavLink to="/about">About</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
