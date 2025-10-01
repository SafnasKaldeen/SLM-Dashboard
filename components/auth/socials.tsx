import { AppleIcon, FacebookIcon, GoogleIcon } from "@/constants/socials";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";

const options = [
  { name: "Google", key: "google", icon: <GoogleIcon size={24} /> },
  // { name: "Facebook", key: "google", icon: <FacebookIcon size={24} /> }, // TODO: Update this hehe
  // { name: "Apple", key: "google", icon: <AppleIcon size={24} /> },
];

const Socials = ({ loading }) => {
  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <Button
          type="button"
          variant="outline"
          key={option.name}
          className="w-full flex justify-start gap-3 px-24 h-12"
          disabled={loading}
          onClick={() => signIn(option.key)}
        >
          {option.icon}
          <div>Continue with {option.name}</div>
        </Button>
      ))}
    </div>
  );
};

export default Socials;
