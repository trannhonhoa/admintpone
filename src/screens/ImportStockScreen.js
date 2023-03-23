import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MainImportStock from './../components/ImportStock/MainImportStock';

const ImportStockScreen = () => {
  return (
    <>
      <Sidebar />
      <main className="main-wrap">
        <Header />
        <MainImportStock/>
      </main>
    </>
  );
};

export default ImportStockScreen;
