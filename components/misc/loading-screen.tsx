import { Loader2 } from "lucide-react";
import React from "react";

const Loading = ({text} : {text?: string}) => {
  return (
    <div className="flex flex-col min-h-32 gap-4 animate-pulse items-center justify-center h-full w-full pb-[15%]">
      <Loader2 className="h-12 w-12 animate-spin text-slate-700" />
      <div className="text-slate-700">{text}</div>
    </div>
  );
};

export default Loading;
