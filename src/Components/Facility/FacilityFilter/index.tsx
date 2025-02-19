import { navigate } from "raviger";
import React, { useCallback, useState, useEffect } from "react";
import { SelectField } from "../../Common/HelperInputFields";
import { CircularProgress } from "@material-ui/core";
import { FACILITY_TYPES } from "../../../Common/constants";
import {
  getStates,
  getDivisionByState,
  getDistrictByDivision,
  getLocalbodyByDistrict,
} from "../../../Redux/actions";
import { debounce } from "lodash";
import { useDispatch } from "react-redux";

function useMergeState(initialState: any) {
  const [state, setState] = useState(initialState);
  const setMergedState = (newState: any) =>
    setState((prevState: any) => Object.assign({}, prevState, newState));

  return [state, setMergedState];
}

const initialStates = [{ id: 0, name: "Choose State *" }];
const initialDivisions = [{ id: 0, name: "Choose Division" }];
const initialDistricts = [{ id: 0, name: "Choose District" }];
const selectStates = [{ id: 0, name: "Please select your state" }];
const selectDivisions = [{ id: 0, name: "Please select your division" }];
const initialLocalbodies = [{ id: 0, name: "Choose Localbody" }];
const selectDistrict = [{ id: 0, name: "Please select your district" }];

function FacillityFilter(props: any) {
  let { filter, onChange, closeFilter } = props;
  const [isFacilityLoading, setFacilityLoading] = useState(false);
  const dispatchAction: any = useDispatch();

  const [isStateLoading, setIsStateLoading] = useState(false);
  const [isDivisionLoading, setIsDivisionLoading] = useState(false);
  const [isDistrictLoading, setIsDistrictLoading] = useState(false);
  const [isLocalbodyLoading, setIsLocalbodyLoading] = useState(false);
  const [states, setStates] = useState(initialStates);
  const [divisions, setDivisions] = useState(selectStates);
  const [districts, setDistricts] = useState(selectDivisions);
  const [localBody, setLocalBody] = useState(selectDistrict);

  const fetchDivisions = useCallback(
    async (id: string) => {
      if (Number(id) > 0) {
        setIsDivisionLoading(true);
        const divisionList = await dispatchAction(getDivisionByState({ id }));
        setDivisions([...initialDivisions, ...divisionList.data]);
        setIsDivisionLoading(false);
      } else {
        setDivisions(selectStates);
      }
    },
    [dispatchAction]
  );

  const fetchDistricts = useCallback(
    async (id: string) => {
      if (Number(id) > 0) {
        setIsDistrictLoading(true);
        const districtList = await dispatchAction(
          getDistrictByDivision({ id })
        );
        setIsDistrictLoading(false);
        if (districtList.data.results.length > 0) {
          setDistricts([...initialDistricts, ...districtList.data.results]);
        } else {
          setDistricts([{ id: 0, name: "No districts found!" }]);
        }
      } else {
        setDistricts(selectDivisions);
      }
    },
    [dispatchAction]
  );

  const fetchLocalBody = useCallback(
    async (id: string) => {
      if (Number(id) > 0) {
        setIsLocalbodyLoading(true);
        const localBodyList = await dispatchAction(
          getLocalbodyByDistrict({ id })
        );
        setIsLocalbodyLoading(false);
        if (localBodyList.data.length > 0) {
          setLocalBody([...initialLocalbodies, ...localBodyList.data]);
        } else {
          setLocalBody([{ id: 0, name: "No local bodies found!" }]);
        }
      } else {
        setLocalBody(selectDistrict);
      }
    },
    [dispatchAction]
  );

  const [filterState, setFilterState] = useMergeState({
    state: filter.state || "",
    division: filter.division || "",
    district: filter.district || "",
    district_ref: null,
    local_body: filter.local_body || "",
    local_body_ref: null,
    facility_type: filter.facility_type || "",
    kasp_empanelled: filter.kasp_empanelled || "",
  });

  const emptyFilterState = {
    state: "",
    district: "",
    district_ref: null,
    local_body: "",
    local_body_ref: null,
    facility_type: "",
    kasp_empanelled: "",
  };

  const setKeys = (selected: any, name: string) => {
    const filterData: any = { ...filterState };
    filterData[`${name}_ref`] = selected;
    filterData[name] = (selected || {}).id;
    setFilterState(filterData);
  };

  const applyFilter = () => {
    const data = {
      state: Number(filterState.state) || "",
      division: Number(filterState.division) || "",
      district: Number(filterState.district) || "",
      local_body: Number(filterState.local_body) || "",
      facility_type: filterState.facility_type || "",
      kasp_empanelled: filterState.kasp_empanelled || "",
    };
    onChange(data);
  };

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    const filterData: any = { ...filterState };
    if (name === "state" && value == 0) {
      filterData["district"] = 0;
      filterData["local_body"] = 0;
    }
    if (name === "district" && value == 0) {
      filterData["local_body"] = 0;
    }
    filterData[name] = value;

    setFilterState(filterData);
  };

  useEffect(() => {
    setIsStateLoading(true);
    loadStates();
  }, []);

  const loadStates = useCallback(
    debounce(async () => {
      const res = await dispatchAction(getStates());
      if (res && res.data) {
        setStates([...initialStates, ...res.data.results]);
      }
      setIsStateLoading(false);
    }, 300),
    []
  );

  return (
    <div>
      <div className="flex justify-between">
        <button className="btn btn-default" onClick={closeFilter}>
          <i className="fas fa-times mr-2" />
          Cancel
        </button>
        <button
          className="btn btn-default"
          onClick={(_) => {
            navigate("/facility");
            setFilterState(emptyFilterState);
          }}
        >
          <i className="fas fa-times mr-2" />
          Clear Filter
        </button>
        <button className="btn btn-primary" onClick={applyFilter}>
          <i className="fas fa-check mr-2" />
          Apply
        </button>
      </div>
      <div className="w-64 flex-none mt-2">
        <div className="font-light text-md mt-2">Filter By:</div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">State</span>
          <div>
            {isStateLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SelectField
                name="state"
                variant="outlined"
                margin="dense"
                value={filterState.state}
                options={states}
                optionValue="name"
                onChange={(e) => {
                  handleChange(e);
                  fetchDivisions(String(e.target.value));
                }}
              />
            )}
          </div>
        </div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">Division</span>
          <div>
            {isDivisionLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SelectField
                name="division"
                variant="outlined"
                margin="dense"
                value={filterState.division}
                options={divisions}
                optionValue="name"
                onChange={(e) => {
                  handleChange(e);
                  fetchDistricts(String(e.target.value));
                }}
              />
            )}
          </div>
        </div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">District</span>
          {isDistrictLoading ? (
            <CircularProgress size={20} />
          ) : (
            <SelectField
              name="district"
              variant="outlined"
              margin="dense"
              value={filterState.district}
              options={districts}
              optionValue="name"
              onChange={(e) => {
                handleChange(e);
                fetchLocalBody(String(e.target.value));
              }}
            />
          )}
        </div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">Local Body</span>
          {isLocalbodyLoading ? (
            <CircularProgress size={20} />
          ) : (
            <SelectField
              name="local_body"
              variant="outlined"
              margin="dense"
              value={filterState.local_body}
              options={localBody}
              optionValue="name"
              onChange={handleChange}
            />
          )}
        </div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">Facility type</span>
          <SelectField
            name="facility_type"
            variant="outlined"
            margin="dense"
            value={filterState.facility_type}
            options={[{ id: "", text: "Show All" }, ...FACILITY_TYPES]}
            onChange={handleChange}
            className="bg-white h-10 shadow-sm md:text-sm md:leading-5 md:h-9"
          />
        </div>

        <div className="w-64 flex-none">
          <span className="text-sm font-semibold">MJPJAY Empanelled</span>
          <SelectField
            name="kasp_empanelled"
            variant="outlined"
            margin="dense"
            value={filterState.kasp_empanelled}
            options={[
              { id: "", text: "Show All" },
              { id: true, text: "Yes" },
              { id: false, text: "No" },
            ]}
            onChange={handleChange}
            className="bg-white h-10 shadow-sm md:text-sm md:leading-5 md:h-9"
          />
        </div>
      </div>
    </div>
  );
}

export default FacillityFilter;
