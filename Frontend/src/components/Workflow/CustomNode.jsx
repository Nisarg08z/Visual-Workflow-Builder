import { Handle, Position } from "reactflow";
import { X } from "lucide-react";

const CustomNode = ({ id, data }) => {
  return (
    <div className="relative group p-4 bg-white rounded shadow border border-orange-400 min-w-[140px] text-sm">
      {/* Label */}
      <div>{data.label}</div>

      {/* Delete Button */}
      <button
        onClick={() => data.onDelete(id)}
        className="absolute top-1 right-1 hidden group-hover:block p-1 bg-red-500 text-white text-xs rounded-full"
      >
        <X size={12} />
      </button>

      {/* Handles (Top, Bottom, Left, Right) */}
      <Handle type="source" position={Position.Top} className="w-2 h-2 bg-orange-500 rounded-full" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-orange-500 rounded-full" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-orange-500 rounded-full" />
      <Handle type="target" position={Position.Right} className="w-2 h-2 bg-orange-500 rounded-full" />
    </div>
  );
};

export default CustomNode;
