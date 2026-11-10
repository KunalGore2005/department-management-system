import { Toaster } from "sonner";

const AppToaster = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3000}
    />
  );
};

export default AppToaster;