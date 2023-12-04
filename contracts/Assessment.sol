// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event NotificationSent(address indexed recipient, string message);
    event EvenSquareCalculated(uint256 input, uint256 result);

    string[] public notifications;

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(_withdrawAmount);
    }

    function sendNotification(address _recipient, string memory _message) public {
        require(msg.sender == owner, "You are not the owner of this account");

        notifications.push(_message);

        emit NotificationSent(_recipient, _message);
    }

    function getAllNotifications() public view returns (string memory) {
        require(msg.sender == owner, "You are not the owner of this account");

        string memory allNotifications;
        for (uint256 i = 0; i < notifications.length; i++) {
            allNotifications = string(abi.encodePacked(allNotifications, notifications[i], "\n"));
        }

        return allNotifications;
    }

    function calculateEvenSquare(uint256 _number) public returns (uint256) {
        require(msg.sender == owner, "You are not the owner of this account");

        
        uint256 result = 0;
        if (_number % 2 == 0) {
            result = _number * _number;
        }

        emit EvenSquareCalculated(_number, result);

        return result;
    }
}
