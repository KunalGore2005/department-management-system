import { useOutletContext } from "react-router-dom";

const modules = import.meta.glob(
    "../pages/*/*.jsx",
    { eager: true }
);

const ModuleRouter = ({ module }) => {

    const user = useOutletContext();

    if (!user) {
        return null;
    }

    const role = user.role?.toLowerCase();

    const path = `../pages/${module}/${role}.jsx`;

    const moduleFile = modules[path];

    if (!moduleFile) {
        return (
            <div className="p-6">
                <h1>Page not available</h1>
            </div>
        );
    }

    const Component = moduleFile.default;

    return <Component />;
};

export default ModuleRouter;