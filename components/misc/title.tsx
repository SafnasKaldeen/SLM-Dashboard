import React from "react";

const Title = ({text}: {text: String}) => {
  return (
    <div className="text-4xl text-muted-foreground p-8 pt-12 bg-white sticky top-0 z-20">
      {text}
    </div>
  );
};

export default Title;
