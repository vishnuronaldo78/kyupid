import React, { useEffect, useState } from "react";
import { Table } from "antd";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";


const Analytics = () => {
  const [userAreaDetails, setUserAreaDetails] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch("https://kyupid-api.vercel.app/api/users")
      .then((response) => response.json())
      .then((data) => {
        const users = data.users;
        fetch("https://kyupid-api.vercel.app/api/areas")
          .then((res) => res.json())
          .then((areaData) => {
            const features = areaData.features;
            const areaDetails = features.map((feat) => feat.properties);
            let userAreaDetail = areaDetails.map((area) => {
              let usersInCurrentArea = users.filter(
                (user) => user.area_id === area.area_id
              );
              let userDetails = {};
              userDetails.paidUsers = usersInCurrentArea.filter(
                (user) => user.is_pro_user
              );
              userDetails.maleUsers = usersInCurrentArea.filter(
                (user) => user.gender === "M"
              );
              userDetails.femaleUsers = usersInCurrentArea.filter(
                (user) => user.gender === "F"
              );
              userDetails.ratio = calculateRatio(
                userDetails.maleUsers.length,
                userDetails.femaleUsers.length
              );
              const reducer = (previousValue, currentValue) =>
                previousValue + currentValue;
              const age = usersInCurrentArea.map((user) => user.age);
              let totalAge = age.reduce(reducer);
              userDetails.averageAge = (
                totalAge / usersInCurrentArea.length
              ).toFixed(0);
              return {
                ...area,
                paidUsers: userDetails.paidUsers.length,
                totalUsers: usersInCurrentArea.length,
                ratio: userDetails.ratio,
                averageAge: userDetails.averageAge,
              };
            });
            setLoading(false);
            setUserAreaDetails(userAreaDetail);
          });
      })
      .catch(err => {
        setLoading(false);
        NotificationManager.error("Failed to fetch data");
      })
  }, []);

  const calculateRatio = (num_1, num_2) => {
    for (let num = num_2; num > 1; num--) {
      if (num_1 % num === 0 && num_2 % num === 0) {
        num_1 = num_1 / num;
        num_2 = num_2 / num;
      }
    }
    var ratio = num_1 + ":" + num_2;
    return ratio;
  };

  const columns = [
    {
      title: "Area id",
      dataIndex: "area_id",
    },
    {
      title: "Area Name",
      dataIndex: "name",
    },
    {
      title: "Paid Users",
      dataIndex: "paidUsers",
      sorter: (a, b) => a.paidUsers - b.paidUsers,
    },
    {
      title: "Total Users",
      dataIndex: "totalUsers",
      sorter: (a, b) => a.totalUsers - b.totalUsers,
    },
    {
      title: "Male to Female Ratio",
      dataIndex: "ratio",
    },
    {
      title: "Average age",
      dataIndex: "averageAge",
    },
  ];

  return (
    <div>
      <h1>Bengaluru User Analytics</h1>
      <Table columns={columns} dataSource={userAreaDetails} loading={loading}/>
      <NotificationContainer />
    </div>
  );
};

export default Analytics;
