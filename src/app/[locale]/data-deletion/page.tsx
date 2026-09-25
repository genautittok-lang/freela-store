import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("data-deletion");
export const generateMetadata = page.generateMetadata;
export default page.Page;
