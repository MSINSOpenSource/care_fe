import loadable from "@loadable/component";
import { navigate } from "raviger";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { statusType, useAbortableEffect } from "../../Common/utils";
import {
  getLastUploadedIcmrDetails,
  externalResultUploadExcel,
  externalResultUploadCsv,
  getAllLocalBodyByDistrict,
} from "../../Redux/actions";
import CSVReader from "react-csv-reader";
import {
  MultilineInputField,
  PhoneNumberField,
  SelectField,
  TextInputField,
} from "../Common/HelperInputFields";
import { ExternalResultLocalbodySelector } from "./ExternalResultLocalbodySelector";
import StateManager from "react-select";
import { CircularProgress } from "@material-ui/core";
import moment from "moment";
const get = require("lodash.get");
const Loading = loadable(() => import("../Common/Loading"));
const PageTitle = loadable(() => import("../Common/PageTitle"));

export default function ExternalResultUpload() {
  const dispatch: any = useDispatch();

  const [uploadFile, setUploadFile] = useState("");
  // for disabling save button once clicked
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(new Array<any>());
  const [errors, setErrors] = useState<any>({});
  const initalState = { loading: false, lsgs: new Array<any>() };
  const [state, setState] = useState(initalState);
  const handleExcelUpload = (event: any) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    dispatch(externalResultUploadExcel(formData))
      .then((res: any) => {
        setLoading(false);
        if (res && res.status >= 200) {
          navigate("/external_results");
        }
      })
      .catch(() => setLoading(false));
  };

  const [lastUploadedDetails, setLastUploadedDetails] = useState<any>({});
  useEffect(() => {
    dispatch(getLastUploadedIcmrDetails()).then((resp: any) => {
      setLastUploadedDetails(resp.data[0]);
    });
  }, []);

  // const fetchLSG = useCallback(
  //   async (status: statusType) => {
  //     setState({ ...state, loading: true });
  //     let id = 7
  //     const res = await dispatch(getAllLocalBodyByDistrict({ id }));
  //     if (!status.aborted) {
  //       if (res && res.data) {
  //         setState({ loading: false, lsgs: res.data.results });
  //       }
  //     }
  //   },
  //   [dispatch]
  // );

  // useAbortableEffect((status: statusType) => {
  //   fetchLSG(status);
  // }, []);

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (header: string) =>
      header.toLowerCase().replace(/\W/g, "_"),
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const valid = true;
    const data = {
      sample_tests: csvData,
    };

    if (valid) {
      setErrors({});
      dispatch(externalResultUploadCsv(data)).then((resp: any) => {
        if (resp && resp.status === 202) {
          setLoading(false);
          navigate("/external_results");
        } else {
          setErrors(resp.data);
        }
      });
    }
  };

  return (
    <div className="px-6">
      <PageTitle title="Upload External Results" hideBack className="mt-4" />
      <div className="max-w-3xl mx-auto mt-6">
        <div className="p-4 ">
          <div className="block text-sm leading-5 font-medium text-gray-700 sm:mt-px sm:pt-2">
            <div className="mt-2 sm:mt-0 sm:col-span-2">
              <div className="mx-auto max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="text-center">
                  {loading ? (
                    <CircularProgress
                      variant="indeterminate"
                      disableShrink
                      size={40}
                      thickness={4}
                    ></CircularProgress>
                  ) : (
                    <button className="btn btn-primary m-0 p-0">
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 cursor-pointer"
                      >
                        <div>
                          Upload excel
                          <input
                            style={{ display: "none" }}
                            id="file-upload"
                            type="file"
                            accept=".xls"
                            onChange={handleExcelUpload}
                          />
                        </div>
                      </label>
                    </button>
                  )}

                  <div>
                    Select an xls file recieved from icmr <br></br> website in
                    the specified format
                  </div>
                  <a
                    className="mt-2 text-xs font-light"
                    href="https://docs.google.com/spreadsheets/d/18p0Bt6CSTbY8IUl1ngL9lKDPNretHMZb/edit#gid=1718304698"
                    target="blank"
                  >
                    Sample Format
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className=" bg-white rounded shadow">
            {csvData.map((data: any, index: number) => {
              return (
                <div key={index} className="p-2 border-b flex">
                  <div className="p-2 mr-2">{index + 1}</div>
                  <div className="p-2 mr-2 md:w-1/3">{data.name}</div>

                  <div className="p-2 mr-2">
                    {errors && errors[index + 1] && (
                      <div>
                        {Object.keys(errors[index + 1]).map(
                          (data: any, index: number) => {
                            return (
                              <div key={index}>
                                {data} -{" "}
                                {errors[index + 1] && errors[index + 1][data]}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                  {/* <div>
                      {
                        !state.loading && <ExternalResultLocalbodySelector lsgs={state.lsgs} />
                      }
                    </div> */}
                </div>
              );
            })}
          </div>
          {lastUploadedDetails && (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-1 m-4 md:px-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm leading-5 font-medium text-gray-500 truncate">
                      Last Uploaded file
                    </dt>
                    <dd className="mt-4 text-2l leading-9 font-semibold text-gray-900 ">
                      {lastUploadedDetails.file_name}
                    </dd>
                  </dl>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm leading-5 font-medium text-gray-500 truncate">
                      Uploaded by
                    </dt>
                    <dd className="mt-4 text-2l leading-9 font-semibold text-gray-900">
                      {lastUploadedDetails.uploaded_by}
                    </dd>
                  </dl>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm leading-5 font-medium text-gray-500 truncate">
                      Most recent date of sample tested in file
                    </dt>
                    <dd className="mt-4 text-2l leading-9 font-semibold text-gray-900">
                      {moment(
                        lastUploadedDetails.most_recent_date_of_sample_tested_in_file
                      ).format("lll")}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
