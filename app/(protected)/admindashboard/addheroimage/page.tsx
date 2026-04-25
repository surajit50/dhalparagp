import React from "react";

const HeroImage: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-8 bg-gradient-to-b from-primary/10 to-background min-h-screen">
      <h1 className="sr-only">Hero Image Management</h1>
      <section className="mb-12" aria-labelledby="upload-section">
        <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md border border-primary/20">
          <h2
            id="upload-section"
            className="text-3xl font-bold text-center mb-6 text-primary"
          >
            Hero Image Upload
          </h2>
        </div>
      </section>

      <section
        className="border border-primary/20 rounded-lg overflow-hidden bg-card"
        aria-labelledby="display-section"
      >
        <h2
          id="display-section"
          className="text-2xl font-semibold text-center border-b border-primary/20 p-4 bg-primary/5 text-primary-foreground"
        >
          All Hero Images
        </h2>
        <div className="p-4"></div>
      </section>
    </main>
  );
};

export default HeroImage;
