<?php
session_start();

$post = [
    'type' => "deposit",
    'api' => '2d0d8bd45682464289276420637eb48f',
    'merchant' => '888100306',
    'order' => 'CHENxx'.$_POST['user'].'xx'.time(),
    'callback' => 'https://pay.chennaiclub.buzz/confirm.php',
    'pay_type' => '102',
    'amount' => $_POST['am'],
];

function post($url, $data)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($curl);

    if ($response === false) {
        echo 'Curl error: ' . curl_error($curl);
        // Handle the error, possibly log it
        die();
    }

    curl_close($curl);

    return $response;
}

$response = post("https://primewin.live/wowpay.php", $post);

// Debugging statements
// echo "Raw Response: <pre>" . htmlspecialchars($response) . "</pre>";

try {
    $jsonResponse = json_decode($response, true);

    // Check if the response is valid JSON
    if ($jsonResponse === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Unable to decode the API response as JSON.");
    }

    // Extract information from the response
    $status = isset($jsonResponse['status']) ? $jsonResponse['status'] : '';
    $payUrl = isset($jsonResponse['payUrl']) ? $jsonResponse['payUrl'] : '';

    // Process the response
    if ($status == 'SUCCESS' && !empty($payUrl)) {
        // Redirect only if payUrl is available
        header("Location: $payUrl");
        exit;
    } else {
        echo "Error: $status - $payUrl";
        if ($status == 'FAIL' && isset($jsonResponse['error'])) {
            echo "<br>Error Message: " . $jsonResponse['error'];
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
