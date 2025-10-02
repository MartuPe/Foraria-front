import React from "react";
import Card from "./ui/ExpensesCard";

export default function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <Card className="qa" >
      <button className="qa__btn" onClick={onClick}>
        <div className="qa__icon">{icon}</div>
        <div>
          <div className="qa__title">{title}</div>
          <div className="qa__subtitle">{subtitle}</div>
        </div>
      </button>
    </Card>
  );
}
