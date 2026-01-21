import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import Cookies from "js-cookie";
import { setUser } from "../store/auth";

const InitialForm = {
  label: "",
  icon: "",
};

const icons = [
  "🚗", // Transportation
  "🛒", // Shopping
  "🧾", // Bills
  "📈", // Investment
  "🍔", // Food
  "☕", // Cafe
  "🏠", // Rent / Home
  "💡", // Electricity
  "📱", // Mobile / Internet
  "💊", // Medical
  "🎓", // Education
  "🎬", // Entertainment
  "✈️", // Travel
  "🚌", // Public transport
  "👕", // Clothing
  "🐶", // Pets
  "🎁", // Gifts
  "💳", // EMI / Credit card
  "🏋️", // Gym
  "🧠", // Personal / Misc
];

export default function CategoryForm({ editCategory, setEditCategory }) {
  const user = useSelector((state) => state.auth.user);
  const token = Cookies.get("token");
  const dispatch = useDispatch();

  const [form, setForm] = useState(InitialForm);
  const [editMode, setEditMode] = useState(false);

  //  HOOKS ALWAYS RUN
  useEffect(() => {
    if (editCategory && editCategory._id) {
      setForm(editCategory);
      setEditMode(true);
    } else {
      setForm(InitialForm);
      setEditMode(false);
    }
  }, [editCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    editMode ? update() : create();
  }

  function handleCancel() {
    setForm(InitialForm);
    setEditMode(false);
    setEditCategory({});
  }

  function reload(res, _user) {
    if (res.ok) {
      setForm(InitialForm);
      setEditMode(false);
      setEditCategory({});
      dispatch(setUser({ user: _user }));
    }
  }

  async function create() {
    if (!user || !user.categories) return;

    const res = await fetch(`${process.env.REACT_APP_API_URL}/category`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const _user = {
      ...user,
      categories: [...user.categories, { ...form }],
    };

    reload(res, _user);
  }

  async function update() {
    if (!user || !user.categories) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/category/${editCategory._id}`,
      {
        method: "PATCH",
        body: JSON.stringify(form),
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const _user = {
      ...user,
      categories: user.categories.map((cat) =>
        cat._id === editCategory._id ? form : cat
      ),
    };

    reload(res, _user);
  }

  if (!user || !user.categories) {
    return null; // or loading spinner
  }

  return (
    <Card sx={{ minWidth: 275, marginTop: 10 }}>
      <CardContent>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Add New Category
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex" }}>
          <TextField
            type="text"
            sx={{ marginRight: 5 }}
            label="Label"
            name="label"
            size="small"
            value={form.label}
            onChange={handleChange}
          />

          <Autocomplete
            value={form.icon}
            onChange={(e, newValue) =>
              setForm({ ...form, icon: newValue })
            }
            options={icons}
            sx={{ width: 200, marginRight: 5 }}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Icon" />
            )}
          />

          {editMode ? (
            <>
              <Button type="submit" color="success" variant="outlined">
                Update
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button type="submit" color="success" variant="contained">
              Submit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
