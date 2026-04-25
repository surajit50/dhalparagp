"use client";


import { Button } from "@/components/ui/button";

import { useState } from "react";
import { MdDelete } from "react-icons/md";

const ProfileImageUpadateform = () => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // Add state to track update process

  const handleFormSubmit = async (event: any) => {};

  const handleRemove = async () => {};

  return (
    <div className="bg-white rounded-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div>
          <div className="w-40 h-40 border"></div>
          <button onClick={handleRemove}>
            <MdDelete size={20} />
          </button>
        </div>
        <div className="w-32 mt-3"></div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      </form>
    </div>
  );
};

export default ProfileImageUpadateform;
