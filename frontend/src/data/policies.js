export default [
	{
		"policyName":"admins",
		"features":[
			{
				"name": "user-management",
				"allow": true
			},
			{
				"name": "security-policy",
				"allow": true
			}
		],
		"topics":[
			{
			   "type": "publish-write",
			   "topicFilter": "",
			   "maxQos": 2,
			   "allowRetain": true,
			   "maxPayloadSize": 1000,
			   "allow": false
			}
		]
	},
	{
		"policyName":"example1",
		"features":[
			{
				"name": "user-management",
				"allow": true
			},
			{
				"name": "security-policy",
				"allow": true
			}
		],
		"topics":[
			{
			   "type": "publish-write",
			   "topicFilter": "",
			   "maxQos": 2,
			   "allowRetain": true,
			   "maxPayloadSize": 1000,
			   "allow": false
			}
		]
	},
	{
		"policyName":"example2",
		"features":[
			{
				"name": "user-management",
				"allow": true
			},
			{
				"name": "security-policy",
				"allow": true
			}
		],
		"topics":[
			{
			   "type": "publish-write",
			   "topicFilter": "",
			   "maxQos": 2,
			   "allowRetain": true,
			   "maxPayloadSize": 1000,
			   "allow": false
			}
		]
	}
]