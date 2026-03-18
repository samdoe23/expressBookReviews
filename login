curl localhost:5000/customer/login -X POST -H "content-type: application/json" --data '{"username": "sam", "password": "123"}'

{ message: "Successfully logged in", username: "sam"}
