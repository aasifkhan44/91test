<?php

$servername = "localhost";
$username = "choudhary";
$password = "choudhary";
$dbname = "choudhary";

// Establish a database connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
if ($_SERVER["REQUEST_METHOD"] == "POST")  {
    $orderid = $_POST['mchOrderNo'];
    $user = (explode("xx",$orderid));
    $username = $user[1];
    $amount = $_POST['oriAmount'];

    $phoneselect="SELECT * FROM users WHERE token='$username' ";
$phonequery=$conn->query($phoneselect);
$phonefetch= mysqli_fetch_assoc($phonequery);
$phone = $phonefetch['phone'];
    
    
    $sql1 = "INSERT INTO sunpay (username, amount, trans, status) VALUES ('$phone', '$amount', '$orderid', 'Success')";
    
   if($conn->query($sql1)){
$sunpayam="SELECT * FROM sunpay WHERE trans='$orderid' ";
$sunpayfetcham=$conn->query($sunpayam);
$sunpayamresult= mysqli_fetch_assoc($sunpayfetcham);
$updateam = $sunpayamresult['amount'];
        $sql2 = "UPDATE users SET  money = money+$updateam WHERE phone='$phone' "; 
 $conn->query($sql2);
     }
     
function random_strings($length_of_string)
{    
    $str_result = '0123456789AXYZ012345678901234567890123456789';    
    return substr(str_shuffle($str_result), 
                       0, $length_of_string);
}

$pre="CHEN";
$r=random_strings(15);  
$rand=$pre.$r;
$tradeResult= $_POST['tradeResult'];


     if($tradeResult=="1"){
         $sql3 = "INSERT INTO recharge (id_order, phone, money, type, status) VALUES ('$rand', '$phone', '$amount', 'Sunpay', '1')";
   $conn->query($sql3);
     }else{
     $sql4 = "INSERT INTO recharge (id_order, phone, money, type, status) VALUES ('$rand', '$phone', '$amount', 'Sunpay', '2')";
   $conn->query($sql4);
     }
$conn -> close();
}else{

echo "Unauthorised Page! Please Return to the main page!";
}

?>