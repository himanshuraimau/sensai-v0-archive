"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// Use dynamic import for the seeder function
import dynamic from "next/dynamic";

// Client-side only import of the seed function
const seedDatabase = async () => {
  // Dynamically import the seed-data module only on client-side
  const module = await import("@/lib/seed-data");
  return module.seedDatabase();
};

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      setMessage("Seeding database...");
      await seedDatabase();
      setMessage("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Database Seeder</h2>
      <Button 
        onClick={handleSeedDatabase} 
        disabled={isSeeding}
      >
        {isSeeding ? "Seeding..." : "Seed Database"}
      </Button>
      
      {message && (
        <p className={`mt-2 ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
