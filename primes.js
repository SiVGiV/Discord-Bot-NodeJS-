/*
	gets a number and returns the prime representation of it.
 */
function disassemble(n){
	var primes = findPrimes(n);
	var divisable = [];
	var endArr = [];
	for(var x of primes)
	{
		if(n%x == 0)
			divisable.push(x);
	}
	if(!isComplete(n, divisable))
	{
		endArr.push(divisable[0]);
		console.log(n + "/" + divisable[0] + "=" + n / divisable[0]);
		endArr = endArr.concat(disassemble(n / divisable[0]));
	}
	else
	{
		endArr = endArr.concat(divisable);
	}
	return endArr;
}
/*
	Gets an integer and returns an array of all primes smaller than it.
 */
function findPrimes(n){
	var primeArr = [];
	var isPrime = true;
	for(var i = 2; (i<=n) && isPrime;i++)
	{
		for(var j = 0; j< primeArr.length && isPrime; j++)
		{
			if(i % primeArr[j] == 0)
			{
				isPrime = false;
			}
		}
		if(isPrime)
		{
			primeArr.push(i);
		}
		isPrime = true;
	}
	return primeArr;
}
/*
	gets a number and an array of primes and returns true only if the multiplication of all primes equals the number.
 */
function isComplete(n, primes){
	var mul = 1;
	for(var i = 0; i<primes.length;i++)
	{
		mul *= primes[i];
	}
	return mul==n;
}
console.log(disassemble(-1));