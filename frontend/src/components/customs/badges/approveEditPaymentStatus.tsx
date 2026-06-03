import { Badge } from "@radix-ui/themes";

type ApproveEditPaymentStatusType = {
  value: string;
};
const ApproveEditPaymentStatus = (props: ApproveEditPaymentStatusType) => {
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

  if (!value) return "";

  switch (value) {
    case "pending":
      textValue = "Pending";
      color = "sky";
      break;
    case "approved":
      textValue = "Approved";
      color = "blue";
      break;
    case "rejected":
      textValue = "Rejected";
      color = "red";
      break;
    case "canceled":
      textValue = "Cancelled";
      color = "gray";
      break;

    default:
      textValue = value;
      break;
  }

  return (
    <Badge variant="soft" color={color} size={"3"}>
      {textValue}
    </Badge>
  );
};

export default ApproveEditPaymentStatus;
