import { Badge } from "@radix-ui/themes";

type RepairCeiptStatusType = {
  value: string;
};
const RepairCeiptStatus = (props: RepairCeiptStatusType) => {
  const { value } = props;

  let color:
    | "gray"
    | "gold"
    | "bronze"
    | "brown"
    | "yellow"
    | "amber"
    | "orange"
    | "tomato"
    | "red"
    | "ruby"
    | "crimson"
    | "pink"
    | "plum"
    | "purple"
    | "violet"
    | "iris"
    | "indigo"
    | "blue"
    | "cyan"
    | "teal"
    | "jade"
    | "green"
    | "grass"
    | "lime"
    | "mint"
    | "sky" = "blue";

  let textValue = value;

  switch (value) {
    case "pending":
      textValue = "Processing";
      color = "sky";
      break;
    case "success":
      textValue = "Completed";
      color = "green";
      break;
    case "cancel":
      textValue = "Cancelled";
      color = "gray";
      break;
    default:
      textValue = "Processing";
      color = "sky";
      break;
  }

  return (
    <Badge variant="soft" color={color} size={"3"}>
      {textValue}
    </Badge>
  );
};

export default RepairCeiptStatus;
