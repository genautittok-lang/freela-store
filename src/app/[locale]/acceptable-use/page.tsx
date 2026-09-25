import { makeLegalPage } from "@/lib/legal";

const page = makeLegalPage("acceptable-use");
export const generateMetadata = page.generateMetadata;
export default page.Page;
