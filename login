# curl command
curl localhost:5000/customer/login -H "content-type: application/json" --data '{"username": "sam", "password": "123"}'

# output
{ message: "Successfully logged in", username: "sam"}
