import React, { useState } from "react";
import { FaCode, FaDatabase, FaMagic } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const nodeGroups = [
  {
    name: "Data",
    color: "border-orange-400",
    nodes: [
      {
        name: "API Fetch",
        description: "Fetch data from REST APIs",
        icon: <FaCode />,
      },
      {
        name: "Database",
        description: "Query databases",
        icon: <FaDatabase />,
      },
    ],
  },
  {
    name: "AI Tools",
    color: "border-purple-400",
    nodes: [
      {
        name: "LLM Prompt",
        description: "Send prompts to LLMs",
        icon: <FaMagic />,
      },
    ],
  },
];

const NodeSidebar = () => {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getFilteredGroups = () => {
    return nodeGroups
      .map((group) => {
        const filteredNodes = group.nodes.filter((node) =>
          node.name.toLowerCase().includes(search.toLowerCase())
        );

        return {
          ...group,
          nodes: filteredNodes,
          shouldOpen: search ? filteredNodes.length > 0 : openGroups[group.name],
        };
      })
      .filter((group) => group.nodes.length > 0 || !search); // hide group if no match during search
  };

  const filteredGroups = getFilteredGroups();

  return (
    <aside className="w-64 bg-white border-r border-gray-300 p-4 space-y-4 overflow-y-auto">
      <input
        type="text"
        placeholder="Search node"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-orange-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      <div className="space-y-4">
        {filteredGroups.map((group, index) => (
          <div
            key={index}
            className={`rounded-md p-3 space-y-2 border ${group.color} bg-orange-50`}
          >
            <h3
              onClick={() => toggleGroup(group.name)}
              className="text-sm font-semibold text-orange-600 cursor-pointer flex justify-between items-center"
            >
              {group.name}
              {!search && (
                <span>{openGroups[group.name] ? "▾" : "▸"}</span>
              )}
            </h3>

            <AnimatePresence initial={false}>
              {(group.shouldOpen || search) && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {group.nodes.map((node, nodeIndex) => (
                    <div
                      key={nodeIndex}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("application/reactflow", JSON.stringify({
                          type: "customNode",
                          label: node.name,
                        }))
                      }
                      className={`p-3 rounded-lg bg-white border ${group.color} cursor-pointer hover:bg-orange-100 transition`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-orange-600 text-xl">
                          {node.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-orange-700">
                            {node.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {node.description}
                          </div>
                        </div>
                      </div>
                    </div>

                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default NodeSidebar;
