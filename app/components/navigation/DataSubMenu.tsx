"use client";

import React, { useContext } from "react";
import { LuFolder } from "react-icons/lu";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import { MdOutlineSpaceDashboard } from "react-icons/md";

import { RouterContext } from "../contexts/RouterContext";

const DataSubMenu: React.FC = () => {
  const { changePage, currentPage } = useContext(RouterContext);

  const toDashboard = () => {
    changePage("data", {}, true);
  };

  const toFiles = () => {
    changePage("files", {}, true);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <p>Dati</p>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem className="list-none" key={"dashboard"}>
          <SidebarMenuButton
            variant={currentPage === "data" ? "active" : "default"}
            onClick={toDashboard}
          >
            <MdOutlineSpaceDashboard />
            <p>Dashboard</p>
          </SidebarMenuButton>
          <SidebarMenuButton
            variant={currentPage === "files" ? "active" : "default"}
            onClick={toFiles}
          >
            <LuFolder />
            <p>File</p>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default DataSubMenu;
