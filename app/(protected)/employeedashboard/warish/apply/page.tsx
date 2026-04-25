import WarishForm from "@/components/form/WarishForm";

const page = async () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Warish Application Form</h1>
      <WarishForm />
    </div>
  );
};

export default page;
