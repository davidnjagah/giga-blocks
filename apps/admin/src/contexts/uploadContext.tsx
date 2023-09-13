import React, { createContext, useContext, useState, useMemo } from 'react';

type UploadContextType = {
  sheetNames: string[];
  tableData: string[][];
  allData: any;
  selectedSheetName: string;
  showStepper: boolean;
  isFileValidated: boolean;
  disableDropZone: boolean;
  productType: string;
  fileName: string;
  typeOfFile: string;
  setSheetNames: React.Dispatch<React.SetStateAction<string[]>>;
  setTableData: React.Dispatch<React.SetStateAction<string[][]>>;
  setAllData: any;
  setSelectedSheetName: React.Dispatch<React.SetStateAction<string>>;
  setShowStepper: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFileValidated: React.Dispatch<React.SetStateAction<boolean>>;
  setDisableDropZone: React.Dispatch<React.SetStateAction<boolean>>;
  setProductType: React.Dispatch<React.SetStateAction<string>>;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  setTypeOfFile: React.Dispatch<React.SetStateAction<string>>;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUploadContext = (): UploadContextType => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploadContext must be used within an UploadContextProvider');
  }
  return context;
};

type UploadContextProviderProps = {
  children: React.ReactNode;
};

const UploadContextProvider: React.FC<UploadContextProviderProps> = ({ children }) => {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [allData, setAllData] = useState<any>([]);
  const [showStepper, setShowStepper] = useState<boolean>(false);
  const [isFileValidated, setIsFileValidated] = useState<boolean>(false);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [disableDropZone, setDisableDropZone] = useState<boolean>(false);
  const [productType, setProductType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [typeOfFile, setTypeOfFile] = useState<string>('csv');

  const contextValue: UploadContextType = useMemo(
    () => ({
      sheetNames,
      tableData,
      allData,
      selectedSheetName,
      showStepper,
      isFileValidated,
      disableDropZone,
      productType,
      fileName,
      typeOfFile,
      setSheetNames,
      setTableData,
      setAllData,
      setSelectedSheetName,
      setShowStepper,
      setIsFileValidated,
      setDisableDropZone,
      setProductType,
      setFileName,
      setTypeOfFile,
    }),
    [
      sheetNames,
      tableData,
      allData,
      selectedSheetName,
      showStepper,
      isFileValidated,
      disableDropZone,
      productType,
      fileName,
      typeOfFile,
    ]
  );

  return <UploadContext.Provider value={contextValue}>{children}</UploadContext.Provider>;
};

export default UploadContextProvider;